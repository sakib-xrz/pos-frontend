import { useMediaQuery } from "react-responsive";

export default function useDesktop(minWidth: number = 1280): boolean {
  return useMediaQuery({ minWidth });
}
