import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono"
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@nikhsingh/medium-common";


export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL : string,
        JWT_SECRET : string
    },
    Variables: {
        userId : string
    }
}>();

//middleware
blogRouter.use('/*' , async(c,next) => {
    const header = c.req.header('authorization') || "";
    const token = header.split(" ")[1];
    try {
        const response = await verify(token,c.env.JWT_SECRET)
    
        if(!response){
            c.status(403)
            return c.json({
                message: "unauthorized"
            })
        }

        c.set('userId',String(response.id))
        await next();
    }catch(e){
        c.status(403)
        return c.json({
            message: "Unauthorized"
        })
    }
  })

blogRouter.post('/', async(c) => {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body)
    if(!success) {
        c.status(411)
        return c.json({
            message: "Inputs are not valid"
        })
    }
    
    const authorId = c.get('userId')
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try{
        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        })
    
        return c.json({
            id: blog.id
        })
    }catch(e){
        c.status(411)
        return c.json({
            message: "Invalid"
        })
    }
})
  
blogRouter.put('/', async(c) => {
    const body = await c.req.json();
    const {success} = updateBlogInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            message: "Inputs are not valid"
        })
    }

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())
    
    try{
        const blog = await prisma.post.update({
            where:{
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content
            }
        })
    
        return c.json({
            id: blog.id
        })
    }catch(e){
        c.status(411)
        return c.json({
            message: "invalid"
        })
    }
})

blogRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const posts = await prisma.post.findMany()
    return c.json({
        posts
    })
    
})

blogRouter.get('/:id', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const id = c.req.param("id");

    try {
        const blog = await prisma.post.findFirst({
            where:{
                id: id
            }
        })
    
        return c.json({
            blog
        })
    }catch(e){
        c.status(404)
        return c.json({
            message: "Error while fetching blog"
        })
    }
})
  
