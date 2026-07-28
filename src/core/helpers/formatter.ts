export const Formatter = {
  capitalize(text: string) {
    if (!text) {
      return '';
    }

    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  fullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`.trim();
  },

  initials(name: string) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  },

  truncate(text: string, length = 30) {
    if (text.length <= length) {
      return text;
    }

    return `${text.substring(0, length)}...`;
  },
};