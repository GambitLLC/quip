export default defineEventHandler(async (event) => {
  const db = await useStorage('db')

  const body = await readBody(event)
  console.log(body)
  return { body }
})
