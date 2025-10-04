export type TabType = "news" | "cartoon" | "games";

export const content: Record<TabType, string[]> = {
  news: [
    "Breaking: React 19 Released!",
    "Vite 5.0 now supports faster HMR",
    "Tailwind CSS introduces new animations",
  ],
  cartoon: [
    "Mickey Mouse Adventures",
    "Tom & Jerry Classics",
    "SpongeBob SquarePants",
  ],
  games: ["Chess", "Ludo", "Tic-Tac-Toe"],
};
export const Contributor = [
    {
    id: 6,
    name: "Geet Srivastava",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758643144/Geet_y3etiz.jpg",
    contributions: 10,
    role: "Figma Expert",
    joinDate: "Sep 2025",
    specialties: ["Figma", "Java", "Backend"],
    isTopContributor: false,
    from: 'BBD University'
  },
    {
    id: 7,
    name: "Pranjal Gupta",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758643144/Geet_y3etiz.jpg",
    contributions: 10,
    role: "AI & ML",
    joinDate: "Oct 2025",
    specialties: ["C", "Python", "Tkinter"],
    isTopContributor: false,
    from: 'BBD University'
  },
    {
    id: 8,
    name: "Akshara Dixit",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758643144/Geet_y3etiz.jpg",
    contributions: 10,
    role: "Web Development",
    joinDate: "Oct 2025",
    specialties: ["C", "Problem Solving"],
    isTopContributor: false,
    from: 'BBD University'
  },

]