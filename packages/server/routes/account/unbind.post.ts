export default defineEventHandler(async (event) => {
  const prisma = usePrisma()
  const response = useResponse()
  const valorantInfo = event.context.valorantInfo

  await prisma.valorantInfo.update({
    where: {
      id: valorantInfo.id,
    },
    data: {
      deleteStatus: true,
    },
  })

  return response(`${valorantInfo.gameName}#${valorantInfo.tagLine}已解绑`)
})
