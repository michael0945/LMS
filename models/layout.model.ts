import { Schema ,model,Document} from "mongoose";



interface FaqItem extends Document{
    question:string,
    answer:string
}
interface Category extends Document{
    title:string
}
interface BannerImages extends Document{
    public_id:string,
    url:string
}
interface Layout extends Document{
    type:string
    faq:FaqItem
    categories:Category
    banner:{
        image:BannerImages
        title:string
        subTitle:string
    }
}
 

const faqSchema =new Schema<FaqItem>({
    question:{type:String},
    answer:{type:String}
})
const categorySchema=new Schema<Category>({
    title:{type:String}
})
const bannerImageSchema=new Schema<BannerImages>({
    public_id:{type:String},
    url:{type:String}
})
const layoutSchema =new Schema <Layout>({
    type:{type:String},
    faq:[faqSchema],
    categories:[categorySchema],
    banner:{
        image:bannerImageSchema,
        title:{type:String},
        subTitle:{title:String}

    }
})


const LayoutModel=model<Layout>("Layout",layoutSchema)
export default LayoutModel
