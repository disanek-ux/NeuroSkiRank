/**
 * Crossref API integration for fetching publication metadata via DOI.
 * API documentation: https://github.com/CrossRef/rest-api-doc
 */

export interface CrossrefMetadata {
  doi: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  publicationType: string;
  abstract?: string;
}

/**
 * Validate DOI format (basic check).
 * DOIs typically start with "10." followed by a number, then a slash and identifier.
 */
export function isValidDoi(doi: string): boolean {
  // Remove common prefixes
  const cleanDoi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "").toLowerCase();
  // Basic DOI format check: starts with 10. and contains /
  return /^10\.\S+\/\S+$/.test(cleanDoi);
}

/**
 * Normalize DOI to standard format (without URL prefix).
 */
export function normalizeDoi(doi: string): string {
  return doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "").toLowerCase();
}

/**
 * Fetch publication metadata from Crossref API.
 * Returns null if DOI not found or API call fails.
 */
export async function fetchCrossrefMetadata(doi: string): Promise<CrossrefMetadata | null> {
  const normalizedDoi = normalizeDoi(doi);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(normalizedDoi)}`, {
      headers: {
        "User-Agent": "NeuroSciRank (https://neurosci-rank.com)",
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.warn(`[Crossref] API returned ${response.status} for DOI: ${normalizedDoi}`);
      return null;
    }

    if (response.status === 204) {
      console.warn(`[Crossref] DOI not found: ${normalizedDoi}`);
      return null;
    }

    const data = (await response.json()) as any;

    if (!data.message) {
      console.warn(`[Crossref] Invalid response format for DOI: ${normalizedDoi}`);
      return null;
    }

    const work = data.message;

    // Extract authors
    const authors: string[] = [];
    if (work.author && Array.isArray(work.author)) {
      authors.push(
        ...work.author.map((author: any) => {
          const parts = [author.given, author.family].filter(Boolean);
          return parts.join(" ");
        })
      );
    }

    // Extract title (handle both string and array)
    let title = "";
    if (typeof work.title === "string") {
      title = work.title;
    } else if (Array.isArray(work.title) && work.title.length > 0) {
      title = work.title[0];
    }

    // Extract journal name
    let journal = "";
    if (work["container-title"]) {
      journal = Array.isArray(work["container-title"])
        ? work["container-title"][0]
        : work["container-title"];
    }

    // Extract publication year
    let year = new Date().getFullYear();
    if (work.issued && work.issued["date-parts"] && work.issued["date-parts"][0]) {
      year = work.issued["date-parts"][0][0];
    }

    // Extract publication type
    const publicationType = work.type || "journal-article";

    // Extract abstract (if available)
    const abstract = work.abstract || undefined;

    return {
      doi: normalizedDoi,
      title,
      authors,
      journal,
      year,
      publicationType,
      abstract,
    };
  } catch (error) {
    console.error(`[Crossref] Error fetching metadata for DOI ${normalizedDoi}:`, error);
    return null;
  }
}

/**
 * Check if a journal is considered "high impact" based on a simple list.
 * This is a simplified approach; in production, you might integrate with
 * a more comprehensive journal impact factor database.
 */
const HIGH_IMPACT_JOURNALS = new Set([
  "nature",
  "science",
  "cell",
  "lancet",
  "jama",
  "bmj",
  "plos one",
  "nature neuroscience",
  "neuron",
  "brain",
  "journal of neuroscience",
  "proceedings of the national academy of sciences",
  "nature communications",
  "scientific reports",
]);

export function isHighImpactJournal(journal: string): boolean {
  if (!journal) return false;
  const lowerJournal = journal.toLowerCase();
  return HIGH_IMPACT_JOURNALS.has(lowerJournal) || HIGH_IMPACT_JOURNALS.has(lowerJournal.split(" ")[0]);
}
