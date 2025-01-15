const replaceVariables = (template: string, values: { [key: string]: string }): string => {
  for (const key in values) {
    template = template.replace(new RegExp(`\\${key}`, 'g'), values[key])
  }
  return template
}

export default replaceVariables
