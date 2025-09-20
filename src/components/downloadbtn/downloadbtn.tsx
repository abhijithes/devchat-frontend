import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

export default function downloadbtn() {
  return (
                    <div className="button w-full text-xs py-6 md:py-8 lg:py-10 flex gap-3 sm:gap-4 md:gap-5">
                    <button className="flex w-auto cursor-pointer">
                        <div className="icon centered w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
                            <TextSnippetOutlinedIcon fontSize="large" />
                        </div>
                        <div className="text flex flex-col items-start justify-center ml-2">
                            <span className="">Download</span>
                            <span className="font-semibold">Attached document</span>
                        </div>
                    </button>
                    <button className="cursor-pointer flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-200 rounded-full">
                        <span className="text-lg sm:text-xl">+</span>
                    </button>
                </div>
  )
}
