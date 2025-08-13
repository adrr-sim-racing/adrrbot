import { guidelines } from '../constants';
import responsesData from '../utils/botResponses.json';

type botResponse = { text: string, file?: string };

const processResponse = (response: botResponse) => {
  return {
    text: response.text.replace(/{guidelines}/g, guidelines),
    file: response.file
  };
};

const guidelineResponses = Object.fromEntries(
  Object.entries(responsesData.guidelineResponses).map(([key, value]) => [key, value.map(processResponse)])
);

const cooldownResponses = (responsesData.cooldownResponses as botResponse[]).map(processResponse);

const addrResponses = (responsesData.addrResponses as botResponse[]).map(processResponse);

export { guidelineResponses, cooldownResponses, addrResponses };
