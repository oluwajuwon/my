
export const findText = (html) => {
  const firstvariable = '<p>';
  const secondvariable = '</p>';

  const final = html.match(new RegExp(firstvariable + "(.*)" + secondvariable))
  return final;
}