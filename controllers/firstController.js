exports.firstFunction = (req, res, next) => {
  console.log("this log form controller");
  res.status(200).json({
    status: "sucsess",
    message: "it is working",
  });
};
