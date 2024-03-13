import { BandaiWorker } from "src/utils";
import { tokenMap } from "src/constants";

export const autoApply = async (event, context) => {
  for (let email in tokenMap) {
    const current = new BandaiWorker(tokenMap[email]);
    const ids = (await current.getParams()).map(({ event_series_id }) => event_series_id);

    const eventIds = (await current.fetchCompetitionList(ids)).map(({ id }) => id);
    console.log("================================");
    console.log("Event IDs", eventIds);
    console.log("================================");
    for (let i = 0; i < eventIds.length; i++) {
      console.log(`Applying for ${eventIds[i]}...`);
      await current.apply(eventIds[i]);
    }
  }
};
export const report = async (event, context) => {
  for (let email in tokenMap) {
    const current = new BandaiWorker(tokenMap[email]);
    console.log("================================");
    console.log("Email: ", email);
    try {
      const { data } = await current.report();
      (data.success.events as any[]).forEach(({ start_datetime, organizer_name, team_status_id }) => {
        if (team_status_id === 2) {
          console.log(`Name: ${organizer_name}`);
          console.log(`Date: ${start_datetime}`);
        }
      });
    } catch (error) {
      console.log(`Failed to report ${email}...`);
    }
  }
};
