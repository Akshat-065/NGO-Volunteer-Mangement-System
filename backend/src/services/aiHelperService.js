import * as volunteerRepository from "../repositories/volunteerRepository.js";
import { serializeVolunteer } from "../utils/serializers.js";

const normalizeSkill = (skill) => skill.trim().toLowerCase();

const uniqueNormalizedSkills = (skills = []) =>
  [...new Set(skills.map((skill) => normalizeSkill(skill)).filter(Boolean))];

const similarityScore = (requiredSkills = [], volunteerSkills = []) => {
  const required = uniqueNormalizedSkills(requiredSkills);
  const volunteer = uniqueNormalizedSkills(volunteerSkills);

  if (!required.length || !volunteer.length) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: required
    };
  }

  const requiredSet = new Set(required);
  const volunteerSet = new Set(volunteer);
  const matchedSkills = required.filter((skill) => volunteerSet.has(skill));
  const unionSize = new Set([...requiredSet, ...volunteerSet]).size;

  return {
    score: unionSize ? matchedSkills.length / unionSize : 0,
    matchedSkills,
    missingSkills: required.filter((skill) => !volunteerSet.has(skill))
  };
};

export const suggestVolunteersBySkills = async (requiredSkills = [], limit = 5) => {
  const volunteers = await volunteerRepository.findVolunteers({}, { populateUser: true });
  const normalizedRequiredSkills = uniqueNormalizedSkills(requiredSkills);

  const rankedVolunteers = volunteers
    .map((volunteer) => {
      const { score, matchedSkills, missingSkills } = similarityScore(
        normalizedRequiredSkills,
        volunteer.skills || []
      );

      return {
        volunteer: serializeVolunteer(volunteer),
        score: Number(score.toFixed(2)),
        matchedSkills,
        missingSkills
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  return {
    requiredSkills: normalizedRequiredSkills,
    suggestions: rankedVolunteers
  };
};
