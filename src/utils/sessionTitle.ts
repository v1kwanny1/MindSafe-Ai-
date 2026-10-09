/**
 * Generates a concise, relevant 3-5 word session title from the user's first message.
 */
export function generateSessionTitle(userMessageText: string): string {
  if (!userMessageText || !userMessageText.trim()) return "New Session";

  // Clean special symbols and extra whitespace
  const clean = userMessageText
    .replace(/[^\w\s'-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const allWords = clean.split(" ").filter(Boolean);
  if (allWords.length === 0) return "New Session";

  // Skip leading low-value filler words if enough words remain
  const initialFillers = new Set([
    "i",
    "im",
    "i'm",
    "am",
    "want",
    "need",
    "can",
    "you",
    "please",
    "just",
    "so",
    "would",
    "like",
    "how",
    "do",
  ]);

  let startIndex = 0;
  while (
    startIndex < allWords.length - 2 && // ensure at least 3 words remain
    initialFillers.has(allWords[startIndex].toLowerCase())
  ) {
    startIndex++;
  }

  const candidateWords = allWords.slice(startIndex);
  // Target 3 to 5 words
  const wordCount = Math.min(5, Math.max(3, candidateWords.length));
  const selectedWords = candidateWords.slice(0, wordCount);

  return selectedWords
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
