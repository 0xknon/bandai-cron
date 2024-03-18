import axios, { AxiosInstance } from "axios";
import { getISODate } from "./date";

export class BandaiWorker {
  client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: "https://api.bandai-tcg-plus.com/api",
      headers: {
        "X-Authentication": token,
      },
    });
  }

  getParams = async () => {
    const { data } = await this.client.get("/user/event/list/params");

    return data.success.event_series_with_game_title_id.filter(
      ({ event_series_title }) => event_series_title.includes("旗艦戰") || event_series_title.includes("現開賽")
    );
  };

  fetchCompetitionList = async (ids: number[]) => {
    const output: any[] = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      const { data } = await this.client.get("/user/event/list", {
        params: {
          event_series_id: id,
          game_title_id: 8,
          limit: 999,
          offset: 0,
          start_date: getISODate(),
        },
      });

      const events = data.success.event_list.filter(({ team_status_id, no_use_tcg_plus }) => ![2, 3].includes(team_status_id) && !no_use_tcg_plus);
      (events as any[]).forEach((v) => output.push(v));
    }

    return output;
  };

  apply = async (eventId: number) => {
    try {
      await this.client.post(`/user/event/apply/${eventId}`, {
        app_version: "1.58.1",
        pref_code_for_add_points: null,
        questionnaire_items: [],
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  report = async () => {
    return await this.client.get("/user/my/event", {
      params: {
        limit: 999,
        offset: 0,
        start_date: getISODate(),
      },
    });
  };
}
