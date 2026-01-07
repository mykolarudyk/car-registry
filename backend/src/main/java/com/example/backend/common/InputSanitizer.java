package com.example.backend.common;

import java.util.regex.Pattern;

public class InputSanitizer {

  private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
  private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script[^>]*>.*?</script>", Pattern.DOTALL);
  private static final Pattern JAVASCRIPT_PATTERN = Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE);
  private static final Pattern ON_EVENT_PATTERN = Pattern.compile("(?i)on\\w+\\s*=", Pattern.CASE_INSENSITIVE);

  /**
   * Sanitizes string input to prevent XSS attacks.
   * Removes HTML tags, script tags, and dangerous attributes.
   * 
   * @param input The input string to sanitize
   * @return Sanitized string safe for display
   */
  public static String sanitize(String input) {
    if (input == null || input.isEmpty()) {
      return input;
    }

    String sanitized = input;
    
    // Remove script tags
    sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");
    
    // Remove javascript: protocol
    sanitized = JAVASCRIPT_PATTERN.matcher(sanitized).replaceAll("");
    
    // Remove event handlers (onclick, onerror, etc.)
    sanitized = ON_EVENT_PATTERN.matcher(sanitized).replaceAll("");
    
    // Remove HTML tags
    sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");
    
    // Escape HTML entities
    sanitized = escapeHtml(sanitized);
    
    return sanitized.trim();
  }

  private static String escapeHtml(String input) {
    if (input == null) {
      return null;
    }
    
    return input
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#x27;");
  }
}

