import React from "react";
import { motion } from "framer-motion";

const slideVariants = {
  hiddenLeft: { opacity: 0, x: -50, y: 30 },
  hiddenRight: { opacity: 0, x: 50, y: 30 },
  visible: { opacity: 1, x: 0, y: 0 },
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg shadow-sm ${className}`}
      style={{ backgroundColor: "#C4F6F9", padding: 10 }}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Badge({ className = "", children, ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Avatar({ className = "", children, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className="aspect-square h-full w-full object-cover" {...props} />;
}

function AvatarFallback({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
      {children}
    </div>
  );
}

interface Contributor {
  id: number;
  name: string;
  avatar: string;
  contributions: number;
  role: string;
  joinDate: string;
  specialties: string[];
  isTopContributor: boolean;
  from: string
}

function ContributorCard({
  contributor,
  isHighlighted = false,
  index,
}: {
  contributor: Contributor;
  isHighlighted?: boolean;
  index: number;
}) {
  return (
    <motion.div
      variants={slideVariants}
      initial={index % 2 === 0 ? "hiddenLeft" : "hiddenRight"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card
        className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${isHighlighted ? "bg-primary/5" : ""
          }`}
      >
        <CardContent>
          <div className="flex items-start gap-4 mb-4 mt-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={contributor.avatar} alt={contributor.name} />
              <AvatarFallback>
                {contributor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="truncate">{contributor.name}</h3>
                {contributor.isTopContributor && (
                  <Badge className="bg-yellow-400 text-white text-xs px-2 py-1">
                    ⭐ Top
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">{contributor.role}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{contributor.contributions} contributions</span>
                <span>Since {contributor.joinDate}</span>
              </div>
              <p className="text-sm text-gray-800 mb-2 mt-2" style={{ fontWeight: 'bold' }} >{contributor.from}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-2">Specialties:</p>
              <div className="flex flex-wrap gap-1">
                {contributor.specialties.map((s, i) => (
                  <Badge
                    key={i}
                    className="border border-gray-300 text-xs px-2 py-1"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const contributors: Contributor[] = [
  {
    id: 1,
    name: "Mohit Sharma",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758555573/MohitSharma.png",
    contributions: 45,
    role: "Lead Developer",
    joinDate: "June 2025",
    specialties: ["React", "TypeScript", "Cloud Computing", "Machine Learning"],
    isTopContributor: true,
    from: 'BBD University'
  },
  {
    id: 2,
    name: "Ansh Jaiswal",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758558389/Ansh_ek6vtz.jpg",
    contributions: 20,
    role: "Backend Developer",
    joinDate: "July 2025",
    specialties: ["Node.js", "Database", "API Design"],
    isTopContributor: true,
    from: 'BBD University'
  },
  {
    id: 3,
    name: "Sumit Rathore",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758621217/Sumit_tbrblr.jpg",
    contributions: 15,
    role: "AI/ML Engineer",
    joinDate: "July 2025",
    specialties: ["Figma", "Backend", "AI/ML Engineer"],
    isTopContributor: true,
    from: 'Future University '
  },
  {
    id: 4,
    name: "Diwakar Kumar",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758559963/Diwaker_olmh3o.jpg",
    contributions: 10,
    role: "Python Developer",
    joinDate: "Aug 2025",
    specialties: ["Python", "Problem Solving", "DSA"],
    isTopContributor: false,
    from: 'Indian Institute of Engineering Science And Technology'
  },
  {
    id: 5,
    name: "Mohd Abbas Haider",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758560710/Valorent_iimzws.jpg",
    contributions: 10,
    role: "Cyber Security",
    joinDate: "Aug 2025",
    specialties: ["C", "Problem Solving", "Computer Networking", "Cyber Security"],
    isTopContributor: false,
    from: 'BBD University'
  },
  {
    id: 6,
    name: "Geet Srivastava",
    avatar:
      "https://res.cloudinary.com/doytvgisa/image/upload/v1758623925/Screenshot_2025-09-23_160822_wamrtb.png",
    contributions: 10,
    role: "Figma Expert",
    joinDate: "Sep 2025",
    specialties: ["Figma", "Java", "Backend"],
    isTopContributor: false,
    from: 'BBD University'
  },
];

export default function ContributorSection() {
  const topContributors = contributors.filter((c) => c.isTopContributor);
  const recentContributors = contributors.filter((c) => !c.isTopContributor);
  const totalContributions = contributors.reduce(
    (sum, c) => sum + c.contributions,
    0
  );


  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          variants={slideVariants}
          initial="hiddenLeft"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-4 text-3xl font-bold">Our Amazing Community</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Meet the incredible people who make our project possible. Together,
            we've made {totalContributions} contributions and counting!
          </p>
          <Badge className="px-4 py-2 bg-teal-500 text-white font-bold">
            {contributors.length} Community Members
          </Badge>
        </motion.div>

        {/* Top Contributors */}
        <section className="mb-16">
          <motion.div
            variants={slideVariants}
            initial="hiddenRight"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="mb-2 text-2xl font-semibold">
              Top Community Members
            </h2>
            <p className="text-gray-500">
              Our most active community members who go above and beyond
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topContributors.map((c, i) => (
              <ContributorCard key={c.id} contributor={c} isHighlighted index={i} />
            ))}
          </div>
        </section>

        {/* Recent Contributors */}
        <section>
          <motion.div
            variants={slideVariants}
            initial="hiddenLeft"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="mb-2 text-xl font-semibold">Recent Contributors</h2>
            <p className="text-gray-500">
              Welcome our newest community members making their mark
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentContributors.map((c, i) => (
              <ContributorCard key={c.id} contributor={c} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
