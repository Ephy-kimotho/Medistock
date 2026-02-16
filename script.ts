import { prisma } from "@/lib/prisma"

async function main() {
    const category = await prisma.category.create({
        data: {
            name: "Pain killer",
            description: "Relieves pain and body aches"
        }
    })

    console.log("created category:", JSON.stringify(category, null, 2))
}


main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })