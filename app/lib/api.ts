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
    name: string;
    title: string;
    description: string;
    completed: {
        completed_at: string
        note: string
    }
  }[];
};
