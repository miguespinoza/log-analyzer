import { expect, test } from "vitest";
import { Filter } from "../components/LogFilesContext";
import { parseLogFile, parseLogLines, searchLines } from "./log-lines-domain";

test("should parse log line", () => {
  const logLine = "2022-09-26T15:49:53.444Z Inf	CID[main] log line";
  const { lines: parsedLogLine } = parseLogLines([logLine], "test", "white");
  expect(parsedLogLine).toEqual([
    {
      date: new Date("2022-09-26T15:49:53.444Z"),
      fileName: "test",
      hash: "6fc3aa43-1bf1-5a3d-b439-bee6dd7f6707",
      id: expect.any(String),
      text: "2022-09-26T15:49:53.444Z Inf	CID[main] log line",
      count: 1,
      fileColor: "white",
    },
  ]);
});
test("should parse log file", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    TMPTestLogs,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(9);
});

test("should search lines with filters", () => {
  const { lines: aLines } = parseLogFile(TMPTestLogs, "a", "white");
  expect(aLines.length).toEqual(9);
  const filter: Filter = {
    id: "test",
    color: "red",
    filter: "test filter",
    hitCount: 0,
  };
  const result = searchLines(aLines, false, [filter]);
  expect(result.lines.length).toEqual(9);

  expect(result.filters[0].hitCount).toEqual(2);
});

test("should search lines with filters and hide all the lines that are not metched by a filter", () => {
  const { lines: aLines } = parseLogFile(TMPTestLogs, "a", "white");
  expect(aLines.length).toEqual(9);
  const filter: Filter = {
    id: "test",
    color: "red",
    filter: "test filter",
    hitCount: 0,
  };
  const result = searchLines(aLines, true, [filter]);
  expect(result.lines.length).toEqual(2);

  expect(result.filters[0].hitCount).toEqual(2);
});

test("should parse log file", () => {
  const fileA = `9/12/2022 11:15:00 PM,INFO,[9152][29]] ... log line
9/12/2022 11:15:00 PM,INFO,[9152][29]] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][102] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
9/12/2022 11:15:07 PM,INFO,[9152][160] ... log line
  `;

  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    fileA,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(13);
});

test.only("should parse teams desktop client logs.txt", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    desktopClientLogs,
    "a",
    "white"
  );
  expect(linesWithoutDateCount).toEqual(0);

  expect(aLines.length).toEqual(8);
});

test("should parse logs witout dates", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    NoDatesLogs,
    "a",
    "white"
  );
  expect(aLines.length).toEqual(8);
  expect(linesWithoutDateCount).toEqual(8);
});

test("should parse UWP etl file", () => {
  const { lines: aLines, linesWithoutDateCount } = parseLogFile(
    etlTestLogs,
    "a",
    "white"
  );
  expect(aLines.length).toEqual(12);
  expect(linesWithoutDateCount).toEqual(0);
});

const TMPTestLogs = `2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.445Z Inf	CID[main] ...log line
2022-09-26T15:49:53.445Z Inf	CID[main] ...log line test filter
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line
2022-09-26T15:49:53.446Z Inf	CID[main] ...log line test filter
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
2022-09-26T15:49:53.444Z Inf	CID[main] ...log line
    grouped line
    grouped line
    grouped line
`;

const etlTestLogs = `36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.584,,TL_INFO ... log line
36E0.1440,09/15/2022-09:34:53.584,,TL_INFO ... log line
    grouped line
    grouped line
    grouped line
    grouped line
    grouped line
    grouped line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.583,,TL_INFO ... log line
36E0.0E80,09/15/2022-09:34:53.584,,TL_INFO ... log line
36E0.1440,09/15/2022-09:34:53.584,,TL_INFO ... log line`;

const NoDatesLogs = `<7200> -- info -- ... log line
<7200> -- info -- ... log line
<7200> -- info -- ... log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line
<7200> -- event -- ...log line`;

const desktopClientLogs = `Wed Sep 28 2022 12:59:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 781 seconds 
Wed Sep 28 2022 13:00:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 811 seconds 
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop:  ble:advertisement-start requested with [6,{"0":52,"1":240,"2":0,"3":229,"4":205,"5":192,"6":9,"7":36,"8":75,"9":113,"10":66,"11":182,"12":149,"13":253,"14":180,"15":80,"16":32,"17":100,"18":79,"19":116,"20":148}] 
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 0 
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 1 
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 2 
Wed Sep 28 2022 13:00:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- RIGEL-SERVICE: RigelService::UpdateBluetoothAdvertisementState true 
Wed Sep 28 2022 13:00:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 841 seconds 
Wed Sep 28 2022 13:01:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 871 seconds 
Wed Sep 28 2022 13:01:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop:  ble:advertisement-start requested with [6,{"0":52,"1":240,"2":0,"3":229,"4":205,"5":192,"6":9,"7":36,"8":75,"9":113,"10":66,"11":182,"12":149,"13":253,"14":180,"15":80,"16":32,"17":100,"18":79,"19":67,"20":6}] 
Wed Sep 28 2022 13:01:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 0 
Wed Sep 28 2022 13:01:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 1 
Wed Sep 28 2022 13:01:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 2 
Wed Sep 28 2022 13:01:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- RIGEL-SERVICE: RigelService::UpdateBluetoothAdvertisementState true 
Wed Sep 28 2022 13:01:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 901 seconds 
Wed Sep 28 2022 13:02:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 931 seconds 
Wed Sep 28 2022 13:02:46 GMT-0700 (Pacific Daylight Time) <912> -- event -- eventpdclevel: 2, name: desktop_set_permission_request_handler, permissions: media, webContentsId: 1, mainWindowURL: https://teams.microsoft.com, tabURL: https://teams.microsoft.com, sameHost: true, isMainWindowWebContents: true, permissionGranted: true, AppInfo.Language: en-us, complianceEnvironmentType: 0, isDataCategorizationEnabled: true, userpdclevel: 0, processMemory: 43326820, freeMemory: 4126773248, clientType: rigel, AppInfo.ClientType: rigel, deviceType: MeetRoom, deviceName: Rigel, rigelVersion: 4.15.6.0, desktopBuildAge: 13, batterylevel: 1, pluggedin: true, Window.Focus: foreground, windowIsVisible: true, Window.Status: systray, UserInfo.TimeZone: -07:00, vdiMode: 0,  
Wed Sep 28 2022 13:02:46 GMT-0700 (Pacific Daylight Time) <912> -- event -- eventpdclevel: 2, name: desktop_set_permission_request_handler, permissions: media, webContentsId: 1, mainWindowURL: https://teams.microsoft.com, tabURL: https://teams.microsoft.com, sameHost: true, isMainWindowWebContents: true, permissionGranted: true, AppInfo.Language: en-us, complianceEnvironmentType: 0, isDataCategorizationEnabled: true, userpdclevel: 0, processMemory: 43353504, freeMemory: 4080619520, clientType: rigel, AppInfo.ClientType: rigel, deviceType: MeetRoom, deviceName: Rigel, rigelVersion: 4.15.6.0, desktopBuildAge: 13, batterylevel: 1, pluggedin: true, Window.Focus: foreground, windowIsVisible: true, Window.Status: systray, UserInfo.TimeZone: -07:00, vdiMode: 0,  
Wed Sep 28 2022 13:02:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop:  ble:advertisement-start requested with [6,{"0":52,"1":240,"2":0,"3":229,"4":205,"5":192,"6":9,"7":36,"8":75,"9":113,"10":66,"11":182,"12":149,"13":253,"14":180,"15":80,"16":32,"17":100,"18":79,"19":181,"20":17}] 
Wed Sep 28 2022 13:02:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 0 
Wed Sep 28 2022 13:02:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 1 
Wed Sep 28 2022 13:02:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 2 
Wed Sep 28 2022 13:02:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- RIGEL-SERVICE: RigelService::UpdateBluetoothAdvertisementState true 
Wed Sep 28 2022 13:02:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 961 seconds 
Wed Sep 28 2022 13:03:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 991 seconds 
Wed Sep 28 2022 13:03:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop:  ble:advertisement-start requested with [6,{"0":52,"1":240,"2":0,"3":229,"4":205,"5":192,"6":9,"7":36,"8":75,"9":113,"10":66,"11":182,"12":149,"13":253,"14":180,"15":80,"16":32,"17":100,"18":79,"19":115,"20":98}] 
Wed Sep 28 2022 13:03:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 0 
Wed Sep 28 2022 13:03:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 1 
Wed Sep 28 2022 13:03:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 2 
Wed Sep 28 2022 13:03:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- RIGEL-SERVICE: RigelService::UpdateBluetoothAdvertisementState true 
Wed Sep 28 2022 13:03:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 1021 seconds 
Wed Sep 28 2022 13:04:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 1051 seconds 
Wed Sep 28 2022 13:04:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop:  ble:advertisement-start requested with [6,{"0":52,"1":240,"2":0,"3":229,"4":205,"5":192,"6":9,"7":36,"8":75,"9":113,"10":66,"11":182,"12":149,"13":253,"14":180,"15":80,"16":32,"17":100,"18":79,"19":157,"20":178}] 
Wed Sep 28 2022 13:04:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 0 
Wed Sep 28 2022 13:04:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 1 
Wed Sep 28 2022 13:04:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 2 
Wed Sep 28 2022 13:04:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- RIGEL-SERVICE: RigelService::UpdateBluetoothAdvertisementState true 
Wed Sep 28 2022 13:04:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 1081 seconds 
Wed Sep 28 2022 13:05:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 1111 seconds 
Wed Sep 28 2022 13:05:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop:  ble:advertisement-start requested with [6,{"0":52,"1":240,"2":0,"3":229,"4":205,"5":192,"6":9,"7":36,"8":75,"9":113,"10":66,"11":182,"12":149,"13":253,"14":180,"15":80,"16":32,"17":100,"18":79,"19":42,"20":215}] 
Wed Sep 28 2022 13:05:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 0 
Wed Sep 28 2022 13:05:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 1 
Wed Sep 28 2022 13:05:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop: ble:publisher-status-changed 2 
Wed Sep 28 2022 13:05:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- RIGEL-SERVICE: RigelService::UpdateBluetoothAdvertisementState true 
Wed Sep 28 2022 13:05:57 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 1141 seconds 
Wed Sep 28 2022 13:06:27 GMT-0700 (Pacific Daylight Time) <912> -- info -- Machine has been idle for 1171 seconds 
Wed Sep 28 2022 13:06:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- Logging telemetry event: idle_investigation 
Wed Sep 28 2022 13:06:55 GMT-0700 (Pacific Daylight Time) <912> -- event -- eventpdclevel: 2, name: idle_investigation, reason: triggered, AppInfo.Language: en-us, complianceEnvironmentType: 0, isDataCategorizationEnabled: true, userpdclevel: 0, processMemory: 43852344, freeMemory: 4052987904, clientType: rigel, AppInfo.ClientType: rigel, deviceType: MeetRoom, deviceName: Rigel, rigelVersion: 4.15.6.0, desktopBuildAge: 13, batterylevel: 1, pluggedin: true, Window.Focus: foreground, windowIsVisible: true, Window.Status: systray, UserInfo.TimeZone: -07:00, vdiMode: 0,  
Wed Sep 28 2022 13:06:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- silent update: restartAppIfPending function - false, false 
Wed Sep 28 2022 13:06:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- Logging telemetry event: idle_investigation 
Wed Sep 28 2022 13:06:55 GMT-0700 (Pacific Daylight Time) <912> -- event -- eventpdclevel: 2, name: idle_investigation, reason: restart-if-pending, AppInfo.Language: en-us, complianceEnvironmentType: 0, isDataCategorizationEnabled: true, userpdclevel: 0, processMemory: 43927504, freeMemory: 4052987904, clientType: rigel, AppInfo.ClientType: rigel, deviceType: MeetRoom, deviceName: Rigel, rigelVersion: 4.15.6.0, desktopBuildAge: 13, batterylevel: 1, pluggedin: true, Window.Focus: foreground, windowIsVisible: true, Window.Status: systray, UserInfo.TimeZone: -07:00, vdiMode: 0,  
Wed Sep 28 2022 13:06:55 GMT-0700 (Pacific Daylight Time) <912> -- info -- BluetoothLE Desktop:  ble:advertisement-start requested with [6,{"0":52,"1":240,"2":0,"3":229,"4":205,"5":192,"6":9,"7":36,"8":75,"9":113,"10":66,"11":182,"12":149,"13":253,"14":180,"15":80,"16":32,"17":100,"18":79,"19":234,"20…`;
