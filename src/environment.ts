/**
 * Convenience function to retrieve ENV Properties in the relevant Google Apps Script project.
 * 
 * @param property the key of the property being retrieved.
 * @returns the value associated with that property key or null if the key doesn't exist.
 */
function env(property: string): string | null {
    let scriptProperties = PropertiesService.getScriptProperties();
    return scriptProperties.getProperty(property);
}