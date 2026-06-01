// script.js
(function() {
  // The plugin route is mounted at /api/plugin/<plugin_id>/...
  const PLUGIN_API_URL = window.location.origin + "/api/plugin/duckai-provider/v1";

  // Hook into Degoog's settings page to auto-fill the AI Summary configuration
  const observer = new MutationObserver((mutations, obs) => {
    const aiSummarySection = document.querySelector('[data-section="ai-summary"]') || document.querySelector('.ai-summary-settings');
    
    if (aiSummarySection) {
      // Look for the API Base URL input
      const apiUrlInput = aiSummarySection.querySelector('input[name="apiBaseUrl"], input[placeholder*="API"]');
      const modelInput = aiSummarySection.querySelector('input[name="model"]');
      const apiKeyInput = aiSummarySection.querySelector('input[name="apiKey"]');

      if (apiUrlInput && !apiUrlInput.value) {
        apiUrlInput.value = PLUGIN_API_URL;
        apiUrlInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (modelInput && !modelInput.value) {
        modelInput.value = "gpt-4o-mini";
        modelInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (apiKeyInput && !apiKeyInput.value) {
        apiKeyInput.value = "dummy-key";
        apiKeyInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log("🦆 DuckAI Provider frontend loaded. API URL:", PLUGIN_API_URL);
})();
