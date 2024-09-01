import { BandaiWorker } from "src/utils";
import { tokenMap } from "src/constants";

export const autoApply = async (event, context) => {
  const { email } = event;
  const current = new BandaiWorker(tokenMap[email]);
  const ids = (await current.getParams()).map(({ event_series_id }) => event_series_id);

  const events = await current.fetchCompetitionList(ids);
  const success: any[] = [];
  const failed: any[] = [];
  for (let i = 0; i < events.length; i++) {
    const result = await current.apply(events[i].id);
    const { event_series_title, organizer_name, start_datetime, street_address } = events[i];
    const event = {
      event: event_series_title,
      shop: organizer_name,
      address: street_address,
      date: start_datetime,
    };
    if (result) {
      success.push(event);
    } else {
      failed.push(event);
    }
  }
  console.log(email, {
    success,
    failed,
  });
};

export const report = async (event, context) => {
  for (let email in tokenMap) {
    const current = new BandaiWorker(tokenMap[email]);
    console.log("================================");
    try {
      const successfullEvents: any[] = [];
      const { data } = await current.report();
      (data.success.events as any[]).forEach(({ start_datetime, organizer_name, street_address, team_status_id, event_series_title }) => {
        if (team_status_id === 2) {
          successfullEvents.push({
            event: event_series_title,
            name: organizer_name,
            address: street_address,
            date: start_datetime,
          });
        }
      });
      console.log(email, successfullEvents);
    } catch (error) {
      console.log(`Failed to report ${email}...`);
    }
  }
};
