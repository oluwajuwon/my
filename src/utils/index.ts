export const findText = (html: string): RegExpMatchArray | null => {
  const firstVariable = '<p>';
  const secondVariable = '</p>';

  return html.match(new RegExp(firstVariable + "(.*)" + secondVariable));
};
