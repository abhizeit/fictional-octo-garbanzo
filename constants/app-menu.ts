export const APP_MENU = [
  {
    label: "Dashboard",
    id: "dashboard",
    icon: "Dashboard",
    name: "Dashboard",
    objects: [
      {
        label: "Product Configuration",
        name: "Product Configuration",
        sub_objects: [
          {
            id: "Category",
            label: "Category",
            path: "/category",
          },
          {
            id: "Attributes",
            label: "Attributes",
            path: "/attribute",
          },
        ],
      },
    ],
  },
];
