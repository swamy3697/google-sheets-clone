export const validateData = (value, rule) => {
    if (rule.type === 'number' && isNaN(value)) return false;
    if (rule.range && (value < rule.min || value > rule.max)) return false;
    return true;
  };