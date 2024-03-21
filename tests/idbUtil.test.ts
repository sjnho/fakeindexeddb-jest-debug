import { IDBUtil } from "../src/idbUtil";
test("removeByIndexUpper", async () => {
  const dtsIdbUtil = new IDBUtil({
    version: 1,
    dbName: "dtsDB",
    storeNames: ["dtsStore"],
    storeConfigs: [
      {
        options: { autoIncrement: true },
        indexConfigs: [{ indexName: "dts", keyPath: "dts" }]
      }
    ]
  });
  await dtsIdbUtil.add("dtsStore", undefined, {
    data: "test",
    dts: new Date()
  });
  await dtsIdbUtil.add("dtsStore", undefined, {
    data: "test",
    dts: new Date()
  });
  await dtsIdbUtil.add("dtsStore", undefined, {
    data: "test",
    dts: new Date()
  });
  const expireDts = new Date();
  expireDts.setDate(expireDts.getDate() - 3);
  await dtsIdbUtil.add("dtsStore", undefined, { data: "test", dts: expireDts });
  const expireDts2 = new Date();
  expireDts2.setDate(expireDts2.getDate() - 2);
  await dtsIdbUtil.add("dtsStore", undefined, {
    data: "test",
    dts: expireDts2
  });
  const allList1 = await dtsIdbUtil.getAllList("dtsStore");
  expect(allList1.length).toEqual(5);
  const removeDts = new Date();
  removeDts.setDate(removeDts.getDate() - 1);
  await dtsIdbUtil.removeByIndexUpper("dtsStore", "dts", removeDts);
  const allList2 = await dtsIdbUtil.getAllList("dtsStore");
  expect(allList2.length).toEqual(3);
});
