const os = require("os");

module.exports.esmfonction = async (req, res) => {
  try {
//mahma ken logique
    res.status(200).json("");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getOsInformatin = async (req, res) => {
  try {
    const osInformation = {
      hostname: os.hostname(),
      type: os.type(),
      platform: os.platform(),
    };
    if (!osInformation) {
      throw new Error("there is no information for you so");
    }
    res.status(200).json(osInformation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.osCpus = async (req, res) => {
  try {
    const osCpus = os.cpus();

    res.status(200).json(osCpus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.osCpusById = async (req, res) => {
  try {
    //? id
    const { id } = req.params; //*****http://localhost:5000/os/cpus/12345679
    const id1  = req.params.id; //http://localhost:5000/os/cpus/12345679
    const id2  = req.params; //galet
    const {id3}  = req.params.id; //ghalet

    console.log(req.params)
    console.log(id1)
    
    //const { idd } = req.body; //http://localhost:5000/os/cpus => body { "id" : "123"}
    //const { iddd, name} = req.query; //http://localhost:5000/os/cpus?id=123
    // const osCpus = os.cpus();
    console.log("params", id);
    //console.log("body", idd);
    //console.log("query", iddd);
    //console.log("query", name);

    const osCpus = os.cpus();

    if (!osCpus) {
      throw new Error("no cpus was found!");
    }

    if (id < 0 || id > osCpus.length - 1) {
      throw new Error("you must provide a valid id");
    }
    res.status(200).json(osCpus[id]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};