
import { User, Skill, Project } from '../types';

// AI Features disabled - not required for MVP
const API_KEY = ""; // process.env.API_KEY;

const generatePortfolioPrompt = (user: User, skills: Skill[], projects: Project[]): string => {
  const skillsText = skills.map(s => `- ${s.name} (Proficiency: ${s.level}/100)`).join('\n');
  const projectsText = projects.map(p => `
    Project: ${p.title}
    Description: ${p.description}
    Technologies: ${p.tags.join(', ')}
  `).join('\n');

  return `
    Analyze the following professional portfolio and provide constructive feedback.
    The feedback should be encouraging and actionable, focusing on strengths and areas for improvement.
    Structure the feedback into three sections: "Overall Impression", "Strengths", and "Suggestions for Improvement".
    Keep the tone professional yet supportive.

    **Portfolio Details:**

    **User Profile:**
    Name: ${user.name}
    Title: ${user.title}
    Bio: ${user.bio}

    **Skills:**
    ${skillsText}

    **Projects:**
    ${projectsText}

    Please provide your analysis now.
  `;
}

export const getPortfolioFeedback = async (user: User, skills: Skill[], projects: Project[]): Promise<string> => {
  // AI Feedback disabled for MVP
  return Promise.resolve("AI Feedback is currently unavailable. Portfolio data captured for future enhancement.");
};
