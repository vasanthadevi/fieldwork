"""Mission questions, each paired with hand-written gold SQL."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Case:
    id: str
    question: str
    gold_sql: str
    ordered: bool = False


CASES = [
    Case("revenue-by-country", "Top 5 countries by revenue. Show the country and revenue.",
         "SELECT billing_country AS country, SUM(total) AS revenue FROM invoice "
         "GROUP BY billing_country ORDER BY revenue DESC, country LIMIT 5", True),
    Case("avg-invoice", "What is the average invoice total?",
         "SELECT ROUND(AVG(total), 4) AS avg_total FROM invoice"),
    Case("customers-per-country", "How many customers are in each of the top 5 countries?",
         "SELECT country, COUNT(*) AS customers FROM customer "
         "GROUP BY country ORDER BY customers DESC, country LIMIT 5", True),
    Case("longest-tracks", "What are the 5 longest tracks? Show name and milliseconds.",
         "SELECT name, milliseconds FROM track ORDER BY milliseconds DESC, name LIMIT 5", True),
    Case("missing-composers", "Show 5 tracks by name and composer, including tracks with no composer.",
         "SELECT name, composer FROM track ORDER BY composer IS NOT NULL, name LIMIT 5", True),
    Case("artist-count", "How many artists are there?",
         "SELECT COUNT(*) AS artists FROM artist"),
    Case("genre-minutes", "Total listening minutes for the top 5 genres.",
         "SELECT g.name AS genre, ROUND(SUM(t.milliseconds) / 60000.0, 2) AS minutes "
         "FROM track t JOIN genre g ON g.genre_id = t.genre_id "
         "GROUP BY g.name ORDER BY minutes DESC, genre LIMIT 5", True),
    Case("media-types", "List all media types.",
         "SELECT name FROM media_type"),
]

BY_QUESTION = {c.question: c for c in CASES}
