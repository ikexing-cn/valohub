export function replacePlaceholder(url: string, ...values: string[]) {
  let index = 0
  return url.replaceAll(/{(.+?)}/g, () => {
    if (index >= values.length) {
      throw new RangeError(
        'Placeholder values are less than the total placeholders!',
      )
    }
    return values[index++]
  })
}
