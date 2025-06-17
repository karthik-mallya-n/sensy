import { motion } from "framer-motion";

export default function LogInOut({ isNavExpanded ,text,clickMe}: { isNavExpanded: boolean ,text : string ,clickMe : ()=>void}) {
  return (
    <motion.button
      whileHover={{
        scale: 0.99,
        backgroundColor: "#0DC5C5",
        backgroundImage: "none",
      }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className="cursor-pointer flex justify-center items-center w-full h-10 text-sm text-white font-semibold rounded-lg py-2 px-3"
      onClick={clickMe}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(7, 115, 115, 1) 0%, rgba(1, 82, 82, 1) 100%)",
      }}
    >
      {isNavExpanded && <span>{text}</span>}
    </motion.button>
  );
}
