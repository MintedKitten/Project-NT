import { useRouter } from "next/router";

const ProjectsPage = () => {
  const router = useRouter();
  const pid = router.query["pid"];
  console.log(pid);

  return <></>;
};
export default ProjectsPage;
