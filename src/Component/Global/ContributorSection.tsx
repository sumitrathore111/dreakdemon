import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Simple reusable animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
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
  return (
    <img
      className="aspect-square h-full w-full object-cover"
      {...props}
    />
  );
}

function AvatarFallback({
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
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
}

function ContributorCard({
  contributor,
  isHighlighted = false,
}: {
  contributor: Contributor;
  isHighlighted?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card
        className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
          isHighlighted ? "bg-primary/5" : ""
        }`}
      >
        <CardContent>
          <div className="flex items-start gap-4 mb-4">
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
    name: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b766?w=400&h=400&fit=crop&crop=face",
    contributions: 147,
    role: "Lead Developer",
    joinDate: "Jan 2023",
    specialties: ["React", "TypeScript", "UI/UX"],
    isTopContributor: true,
  },
  {
    id: 2,
    name: "Alex Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    contributions: 98,
    role: "Backend Engineer",
    joinDate: "Mar 2023",
    specialties: ["Node.js", "Database", "API Design"],
    isTopContributor: true,
  },
  {
    id: 3,
    name: "Maya Patel",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    contributions: 89,
    role: "Designer",
    joinDate: "Feb 2023",
    specialties: ["Figma", "Design Systems", "Accessibility"],
    isTopContributor: true,
  },
  {
    id: 4,
    name: "David Kim",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    contributions: 76,
    role: "DevOps Engineer",
    joinDate: "Apr 2023",
    specialties: ["Docker", "CI/CD", "Cloud"],
    isTopContributor: false,
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
          variants={fadeUp}
          initial="hidden"
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
            variants={fadeUp}
            initial="hidden"
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
            {topContributors.map((c) => (
              <ContributorCard key={c.id} contributor={c} isHighlighted />
            ))}
          </div>
        </section>

        {/* Recent Contributors */}
        <section>
          <motion.div
            variants={fadeUp}
            initial="hidden"
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
            {recentContributors.map((c) => (
              <ContributorCard key={c.id} contributor={c} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
