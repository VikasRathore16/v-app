const aws = require("aws-sdk");
let config = {
  AWS: {
    accessKeyId: "AKIAQVLXFEA374CRWWLP",
    secretAccessKey: "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",
    region: "ca-central-1",
    videoBucket: "blabla-media",
  },

  transcode: {
    video: {
      pipelineId: "1450364128039-xcv57g",
      outputKeyPrefix: "transcoded/", // put the video into the transcoded folder
      presets: [
        // Comes from AWS console
        { presetId: "1351620000001-000040", suffix: "_360" },
        { presetId: "1351620000001-000020", suffix: "_480" },
      ],
    },
  },
};

aws.config.update({
  accessKeyId: config.AWS.accessKeyId,
  secretAccessKey: config.AWS.secretAccessKey,
  region: config.AWS.region,
});

var transcoder = new aws.ElasticTranscoder();

let transcodeVideo = function (key, callback) {
  // presets: http://docs.aws.amazon.com/elastictranscoder/latest/developerguide/system-presets.html
  let params = {
    PipelineId: config.AWS.transcode.video.pipelineId, // specifies output/input buckets in S3
    Input: {
      Key: key,
    },
    OutputKeyPrefix: config.AWS.transcode.video.outputKeyPrefix,
    Outputs: config.AWS.transcode.video.presets.map((p) => {
      console.log( { Key: `${key}${p.suffix}`, PresetId: p.presetId });
      return { Key: `${key}${p.suffix}`, PresetId: p.presetId };

    }),
  };
  params.Outputs[0].ThumbnailPattern = `${key}-{count}`;
  transcoder.createJob(params, function (err, data) {
    if (!!err) {
      logger.err(err);
      return;
    }
    let jobId = data.Job.Id;
    logger.info("AWS transcoder job created (" + jobId + ")");
    transcoder.waitFor("jobComplete", { Id: jobId }, callback);
  });
};

console.log(transcodeVideo('elasticbeanstalk-ca-central-1-045883924535'));