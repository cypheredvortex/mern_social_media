import Post from "../models/Post.js";

export async function list_post(req,res){
    try{
        const posts=await Post.find().sort({created_at:-1});
        res.status(200).json(posts);
    }catch(error){
        console.error("Error in list_post controller",error);
        res.status(500).json({message:"Internal server error!"});
    }
};

export async function get_post_by_id(req,res){
    try{
        const post = await Post.find().populate('author_id', 'username email').sort({ createdAt: -1 });res.json(posts);
        if(!post){
            return res.status(404).json({message:"Post not found!"});
        }
        res.status(200).json(post);
    }catch(error){
        console.error("Error in get_post_by_id controller",error);
        res.status(500).json({message:"Internal server error!"});
    }
};

export async function create_post(req,res){
    try{
        const {author_id, content, media_url, visibility, like_count, comment_count, share_count}= req.body;
        const post=new Post({author_id, content, media_url, visibility, like_count, comment_count, share_count});
        const savedPost=await post.save();
        res.status(201).json(savedPost);
    }catch(error){
        console.error("Error in create_post controller",error);
        res.status(500).json({message:"Internal server error!"});
    }
}

export async function update_post(req,res){
    try{
        const {author_id, content, media_url, visibility, like_count, comment_count, share_count}= req.body;
        const updatedPost=await Post.findByIdAndUpdate(req.params.id, {author_id, content, media_url, visibility, like_count, comment_count, share_count}, {new:true});
        if(!updatedPost){
            return res.status(404).json({message:"Post not found!"});
        }
        res.status(200).json(updatedPost);
    }catch(error){
        console.error("Error in update_post controller",error);
        res.status(500).json({message:"Internal server error!"});
    }
}

export async function delete_post(req,res){
    try{
        const deletedPost=await Post.findByIdAndDelete(req.params.id);
        if(!deletedPost){
            return res.status(404).json({message:"Post not found!"});
        }
        res.status(200).json({message:"Post deleted successfully!"});
    }catch(error){
        console.error("Error in delete_post controller",error);
        res.status(500).json({message:"Internal server error!"});
    }
}