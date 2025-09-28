const GlobalLoader = () => {
    return (
        <div className="w-full h-screen fixed z-50 bg-black/70 grid place-items-center ">
            <div className=" w-20 h-20  border-4 border-white grid place-items-center animate-bounce rounded-full">
                <div className=" w-14 h-14 rounded-full border-8 border-dashed border-transparent  border-e-green-500 border-t-white  animate-spin ">
                </div>
            </div>
        </div>
    )
}

export default GlobalLoader
