import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper, List, ListItem, CircularProgress, IconButton, Avatar } from '@mui/material';
import { Edit, Delete, Send } from '@mui/icons-material';
import { DataGrid, GridColDef, GridCellParams   } from '@mui/x-data-grid';


interface ServerData {
  id: string;
  [key: string]: any;
}

interface Message {
  text: string | React.ReactNode;
  sender: 'user' | 'bot';
  id: number;
  isEditing?: boolean;
  tableData?: ServerData[]; // Add tableData to Message
  columns?: GridColDef[];   // Add columns to Message
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* const formatResponseToTableData = (data: any[]): ServerData[] => {
  if (!data || data.length === 0) return [];

  return data.map((item, index) => {
    // Extraction des données imbriquées
    let sourceData = item;
    if (item.s && typeof item.s === 'object') {
      sourceData = item.s; // Cas des requêtes serveur
    } else if (item.c && typeof item.c === 'object') {
      sourceData = item.c; // Cas des requêtes cluster
    } else if (item.v && typeof item.v === 'object') {
      sourceData = item.v; // Cas des requêtes VM
    } else if (item.d && typeof item.d === 'object') {
      sourceData = item.d; // Cas des requêtes datastore
    }

    const cleanedItem: ServerData = { id: `row_${index}` };
    let hasUniqueId = false;

    // Traitement des propriétés
    for (const [key, value] of Object.entries(sourceData)) {
      const cleanedKey = key.replace(/^(s|c|d|v|ds)\./, '');
      cleanedItem[cleanedKey] = value;

      if (cleanedKey === 'id' && value && !hasUniqueId) {
        cleanedItem.id = value as string;
        hasUniqueId = true;
      } else if (cleanedKey === 'name' && value && !hasUniqueId) {
        cleanedItem.id = value as string;
        hasUniqueId = true;
      }
    }

    return cleanedItem;
  });
}; */
const formatResponseToTableData = (data: any[]): ServerData[] => {
  if (!data || data.length === 0) return [];

  return data.map((item, index) => {
    const cleanedItem: ServerData = { id: `row_${index}` };
    let hasUniqueId = false;

    // Gérer les propriétés imbriquées (e.g., properties(s))
    const sourceData = item['properties(s)'] || item.s || item.c || item.v || item.d || item;

    for (const [key, value] of Object.entries(sourceData)) {
      const cleanedKey = key.replace(/^(s|c|d|v|ds)\./, '');
      cleanedItem[cleanedKey] = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;

      if (cleanedKey === 'id' && value && !hasUniqueId) {
        cleanedItem.id = value as string;
        hasUniqueId = true;
      } else if (cleanedKey === 'name' && value && !hasUniqueId) {
        cleanedItem.id = value as string;
        hasUniqueId = true;
      }
    }

    return cleanedItem;
  });
};
  const handleSend = async (text: string, messageId?: number) => {
    if (!text.trim()) return;

    setLoading(true);

    if (messageId !== undefined) {
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, text, isEditing: false } : msg
      );
      setMessages(updatedMessages);
    } else {
      const userMessage: Message = {
        text,
        sender: 'user',
        id: messageIdCounter.current++,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
    }

    try {
      const response = await axios.post('http://localhost:8000/chatbot/query', {
        query: text,
        limit: 100,
      });
      const botResponse = response.data.response;
      console.log('Backend response length:', botResponse.length, botResponse);

      let botMessage: Message = {
        text: '',
        sender: 'bot',
        id: messageIdCounter.current++,
      };

      if (Array.isArray(botResponse)) {
        const botTableData = formatResponseToTableData(botResponse);
        console.log('Formatted botTableData:', botTableData);
        const newColumns: GridColDef[] = botTableData.length > 0
          ? Object.keys(botTableData[0])
              .filter((key) => key !== 'id')
              .map((key) => ({
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                width: 150,
                editable: false,
               valueFormatter: (params: GridCellParams) => {
          if (params.value && typeof params.value === 'object') {
            return JSON.stringify(params.value);
          }
          return params.value;
        }
              }))
          : [];
        botMessage = {
          ...botMessage,
          text: `Retrieved ${botTableData.length} nodes`,
          tableData: botTableData,
          columns: newColumns,
        };
      } else if (typeof botResponse === 'object' && botResponse !== null) {
        const botTableData = formatResponseToTableData([botResponse]);
        console.log('Formatted botTableData:', botTableData);
        const newColumns: GridColDef[] = botTableData.length > 0
  ? Object.keys(botTableData[0])
      .filter((key) => key !== 'id')
      .map((key) => ({
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        width: 150,
        editable: false,
        valueFormatter: (params: GridCellParams) => {
          if (params.value && typeof params.value === 'string') {
            try {
              const parsed = JSON.parse(params.value);
              return JSON.stringify(parsed, null, 2);
            } catch {
              return params.value;
            }
          }
          return params.value;
        },
      }))
  : [];
        botMessage = {
          ...botMessage,
          text: `Retrieved 1 node`,
          tableData: botTableData,
          columns: newColumns,
        };
      } else {
        botMessage.text = botResponse;
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessageText = 'Error: Could not get a response from the server.';
      if (axios.isAxiosError(error) && error.response) {
        const errorDetail = error.response.data?.detail;
        if (errorDetail) {
          const syntaxErrorMatch = errorDetail.match(/{message: (.*?)}/);
          if (syntaxErrorMatch) {
            errorMessageText = `Error: Invalid query syntax - ${syntaxErrorMatch[1]}`;
          } else {
            errorMessageText = `Error: ${errorDetail}`;
          }
        }
      }
      if (error instanceof Error) {
        errorMessageText = `Error: ${error.message}`;
      }
      const errorMessage: Message = {
        text: errorMessageText,
        sender: 'bot',
        id: messageIdCounter.current++,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSend(input);
    }
  };

  const handleEdit = (message: Message) => {
    if (typeof message.text === 'string') {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, isEditing: true } : msg
        )
      );
      setEditText(message.text);
    }
  };

  const handleSaveEdit = (messageId: number) => {
    handleSend(editText, messageId);
    setEditText('');
  };

  const handleCancelEdit = (messageId: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isEditing: false } : msg
      )
    );
    setEditText('');
  };

  const handleDelete = (messageId: number) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const messagesToRemove =
      messages[messageIndex].sender === 'user' && messages[messageIndex + 1]?.sender === 'bot'
        ? [messageId, messages[messageIndex + 1].id]
        : [messageId];

    setMessages((prev) => prev.filter((msg) => !messagesToRemove.includes(msg.id)));
  };

  return (
    <Box
      sx={{
        p: 3,
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1B56FD' }}>
        Chatbot
      </Typography>
      <Paper
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          overflowY: 'auto',
          bgcolor: '#fff',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem
                sx={{
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  mb: 1,
                  position: 'relative',
                  '&:hover .action-buttons': {
                    opacity: 1,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.sender === 'user' ? '#1976d2' : '#e0e0e0',
                    mr: message.sender === 'user' ? 0 : 2,
                    ml: message.sender === 'user' ? 2 : 0,
                  }}
                >
                  {message.sender === 'user' ? 'U' : 'B'}
                </Avatar>
                <Box sx={{ maxWidth: '70%' }}>
                  {message.isEditing ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSaveEdit(message.id)}
                        size="small"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleCancelEdit(message.id)}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Paper
                        sx={{
                          p: 1.5,
                          bgcolor: message.sender === 'user' ? '#1976d2' : '#f1f1f1',
                          color: message.sender === 'user' ? 'white' : 'black',
                          borderRadius: '15px',
                          borderTopRightRadius: message.sender === 'user' ? '0' : '15px',
                          borderTopLeftRadius: message.sender === 'user' ? '15px' : '0',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {typeof message.text === 'string' && message.text.includes('|') ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: message.text
                                .replace(/\|/g, '│')
                                .split('\n')
                                .map((line) => line.trim())
                                .join('<br>'),
                            }}
                          />
                        ) : (
                          message.text
                        )}
                      </Paper>
                      {message.sender === 'user' && typeof message.text === 'string' && (
                        <Box
                          className="action-buttons"
                          sx={{
                            display: 'flex',
                            gap: 1,
                            mt: 0.5,
                            justifyContent: 'flex-end',
                            opacity: 0,
                            transition: 'opacity 0.3s',
                          }}
                        >
                          <IconButton size="small" onClick={() => handleEdit(message)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(message.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </ListItem>
              {message.tableData && message.tableData.length > 0 && message.columns && (
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <DataGrid
                      rows={message.tableData}
                      columns={message.columns}
                      pagination
                      pageSizeOptions={[10, 20, 25, 50]}
                      autoHeight
                      getRowId={(row) => row.id}
                      disableRowSelectionOnClick
                      initialState={{
                        pagination: { paginationModel: { page: 0, pageSize: 10 } },
                      }}
                      sx={{
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                        },
                        '& .MuiDataGrid-row': {
                          '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' },
                          '&:hover': { backgroundColor: '#e0f7fa' },
                        },
                        '& .MuiDataGrid-footerContainer': {
                          display: 'flex',
                          justifyContent: 'flex-end',
                        },
                      }}
                    />
                  </Box>
                </ListItem>
              )}
            </React.Fragment>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress size={24} sx={{ color: '#1976d2' }} />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your query (e.g., 'donner la liste des Switchs')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{
            bgcolor: '#fff',
            borderRadius: '25px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '25px',
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={() => handleSend(input)}
          disabled={loading}
          sx={{
            bgcolor: '#1976d2',
            color: 'white',
            '&:hover': { bgcolor: '#1565c0' },
            borderRadius: '50%',
            width: 48,
            height: 48,
          }}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chatbot;