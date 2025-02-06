import ViewStream from "./view-stream";

const ViewStreamTest = () => {
  const params = new URLSearchParams(window.location.search);
  const userType = params.get("userType") as "host" | "guest";
  const roomName = params.get("room") || "kzo-qoq-mt3";
  return (
    <div className="">
      <ViewStream roomName={roomName} userType={userType} />
    </div>
  );
};

export default ViewStreamTest;

  // const testRecord = async () => {
  //   const data = {
  //     roomName,
  //     userType,
  //     userName: "host",
  //     wallet: publicKey?.toString() ?? "",
  //   };
  //   const response = await fetch(`${baseApi}/livestream/record`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   console.log(response);
  // };