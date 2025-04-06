import { useParams } from "react-router-dom"
import { useBlog } from "../hooks"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { AppBar } from "../components/AppBar";

export const Blog = () => {
    const { id } = useParams();
    const {blog,loading} = useBlog({
        id: id || ""
    })
    if(loading){
        return <div>
            <AppBar />
            <div className="h-screen flex flex-col justify-center">
                <div className="flex justify-center">
                    <Spinner />
                </div>
            </div>
        </div>
    }
    return <Post blog={blog}/>
}