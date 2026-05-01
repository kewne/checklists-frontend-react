type Checklist = {
  title: string;
  items: ChecklistItem[];
};

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
};

type ChecklistRun = {
  title: string;
  items: {
    id: string;
    title: string;
    description: string;
  }[];
};
