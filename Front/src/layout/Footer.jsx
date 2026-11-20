import {Link} from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-stone-50 text-stone-950 py-20 px-8 md:px-16 border-t border-stone-200">
        <div className="flex-1">
            <h2 className="text-4xl md:text-4xl tracking-wide px-15 font-bold">GRAND SERVICE</h2>

        </div>

                
                    <div className="flex justify-center text-sm font-medium tracking-wider uppercase"> 
                    
                    
                            <div className="flex flex-col items-start gap-4"> 
                                <Link className="hover:text-stone-600 transition-colors">Home</Link> 
                                <Link className="hover:text-stone-600 transition-colors">Product</Link> 
                                <Link className="hover:text-stone-600 transition-colors">About</Link> 
                            </div>
                            
                            <div className="">
                              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8k6MLc4J76tKBzHwnvqU4cIl_v597V-fEzoaglx9yzQ&s=10"  className="w-20 h-20" />
                            </div>
                            

                    </div>

    </footer>
  )
}
