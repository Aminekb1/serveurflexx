export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  isPro?:boolean
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  isPro?:boolean
}

import { uniqueId } from "lodash";
 
const SidebarContent: MenuItem[] = [
  {
    heading: "HOME",
    children: [
      {
        name: "Dashboard",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "",
        isPro: false,
      },
      
      
    ],
  },
  {
    heading: "MANAGE",
    children: [
      {
        name: "Orders",
        icon: "solar:chart-line-duotone",
        id: uniqueId(),
        url: "/dashboard/Orders", 
        isPro: false,
      },
      {
        name: "Invoices",
        icon: "solar:graph-line-duotone",
        id: uniqueId(),
        url: "/dashboard/Invoices", 
        isPro: false,
      },
      {
        name: "Notifications",
        icon: "solar:graph-line-duotone",
        id: uniqueId(),
        url: "/dashboard/Notifications", 
        isPro: false,
      },
      {
        name: "Resources",
        icon: "solar:chat-round-line-line-duotone",
        id: uniqueId(),
        url: "/dashboard/Resources", 
        isPro: false,
      },
      {
        name: "UserManagement",
        icon: "solar:chat-round-line-line-duotone", 
        id: uniqueId(),
        url: "/dashboard/UserManagement", 
        isPro: false,
      },
    ],
  },
  {
    heading: "SETTINGS",
    children: [
      
      {
        name: "Account Settings",
        icon: "solar:document-text-outline",
        id: uniqueId(),
        url: "/dashboard/AccountSettings",
        isPro: false,
      },
      
    ],
  },
  
  

];

export default SidebarContent;
