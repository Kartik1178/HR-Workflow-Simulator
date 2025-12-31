// Mock marine aquatic data responses
export const marineResponses = [
  {
    question: "great white shark",
    response: "The Great White Shark (Carcharodon carcharias) is one of the ocean's apex predators. They can grow up to 20 feet in length and weigh over 5,000 pounds. Found in cool, coastal waters worldwide, they have an incredible sense of smell and can detect a single drop of blood in 25 gallons of water. Despite their fearsome reputation, they're curious creatures and attacks on humans are rare."
  },
  {
    question: "coral reef",
    response: "Coral reefs are underwater ecosystems held together by calcium carbonate structures secreted by corals. They're often called 'rainforests of the sea' because they support approximately 25% of all marine species. Coral reefs provide habitat for over 4,000 species of fish, 700 species of coral, and thousands of other plants and animals. They're vital for ocean health but are threatened by climate change and ocean acidification."
  },
  {
    question: "clownfish",
    response: "Clownfish (Amphiprioninae) are small, colorful fish famous for their symbiotic relationship with sea anemones. The mucus coating on their skin protects them from the anemone's stinging tentacles. They live in small groups with a strict hierarchy - the largest is female, the second largest is the breeding male, and the rest are non-breeding males. If the female dies, the breeding male will change sex and become female!"
  },
  {
    question: "ocean depth",
    response: "The ocean has five main zones: Epipelagic (0-200m, sunlight zone), Mesopelagic (200-1000m, twilight zone), Bathypelagic (1000-4000m, midnight zone), Abyssopelagic (4000-6000m, abyss), and Hadopelagic (6000m+, trenches). The deepest point is the Mariana Trench at approximately 11,000 meters (36,000 feet). Pressure at these depths is over 1,000 times that at sea level!"
  },
  {
    question: "blue whale",
    response: "The Blue Whale is the largest animal ever known to have existed on Earth, reaching lengths of up to 100 feet and weighing as much as 200 tons. Their heart alone can weigh as much as a car! Despite their massive size, they feed almost exclusively on tiny krill, consuming up to 4 tons per day. Their calls can reach 188 decibels and be heard by other whales hundreds of miles away."
  },
  {
    question: "seahorse",
    response: "Seahorses are unique fish with a horse-like head and a prehensile tail. They're one of the only species where males become pregnant and give birth! The female deposits her eggs into the male's brood pouch, where he fertilizes and carries them for 2-4 weeks. Seahorses mate for life and greet each other every morning with an elaborate courtship dance."
  },
  {
    question: "jellyfish",
    response: "Jellyfish have existed for over 500 million years, making them older than dinosaurs! They're 95% water and have no brain, heart, or bones. Some species are bioluminescent and glow in the dark. The Box Jellyfish is one of the most venomous creatures in the ocean. Despite their simple structure, jellyfish are incredibly successful survivors found in every ocean."
  },
  {
    question: "dolphin",
    response: "Dolphins are highly intelligent marine mammals known for their playful behavior and complex social structures. They use echolocation to navigate and hunt, emitting clicks that bounce off objects to create a mental map. Dolphins have been observed using tools, teaching learned behaviors to offspring, and even showing empathy by helping injured individuals. They can recognize themselves in mirrors, a sign of self-awareness."
  },
  {
    question: "octopus",
    response: "Octopuses are incredibly intelligent invertebrates with three hearts, blue blood, and the ability to change color and texture instantly. They have nine brains - one central brain and one in each arm! Each arm can taste what it touches and can operate somewhat independently. Octopuses can squeeze through any opening larger than their beak and are master escape artists."
  },
  {
    question: "sea turtle",
    response: "Sea turtles are ancient mariners that have existed for over 100 million years. There are seven species, including the Leatherback (largest), Green, Hawksbill, and Loggerhead. They can hold their breath for hours and migrate thousands of miles between feeding and nesting grounds. Female sea turtles return to the same beach where they were born to lay their eggs, an incredible feat of navigation."
  }
];

export const getMarineResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Find matching response
  for (let data of marineResponses) {
    if (message.includes(data.question.toLowerCase())) {
      return data.response;
    }
  }
  
  // Default responses for common queries
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! I'm your Marine Aquatic Assistant. Ask me anything about ocean life, marine species, or aquatic ecosystems!";
  }
  
  if (message.includes('help')) {
    return "I can help you learn about marine life! Try asking about: Great White Sharks, Coral Reefs, Clownfish, Blue Whales, Dolphins, Octopuses, Sea Turtles, Jellyfish, Ocean Depths, or any other marine topics!";
  }
  
  // Generic marine-related response
  return "That's an interesting question about marine life! While I don't have specific information on that topic in my current database, the ocean is full of incredible creatures and phenomena. Did you know that we've explored less than 5% of the world's oceans? Try asking me about specific species like sharks, whales, dolphins, or ocean ecosystems!";
};

export const welcomeMessage = "Welcome to Marine Aquatic Data Chat! 🌊 I'm here to share fascinating information about ocean life, marine species, and aquatic ecosystems. What would you like to explore today?";

export const quickPrompts = [
  "Tell me about Great White Sharks",
  "What are coral reefs?",
  "Facts about Blue Whales",
  "How deep is the ocean?",
  "Tell me about dolphins",
  "What makes octopuses special?"
];