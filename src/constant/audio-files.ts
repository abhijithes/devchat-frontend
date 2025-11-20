import NotifationSoundOne from "../assets/notification-sounds/one.mp3";
import NotifationSoundTwo from "../assets/notification-sounds/two.mp3";
import NotifationSoundThree from "../assets/notification-sounds/three.mp3";
import MessageRecieveAuidio from "../assets/message-sounds/MessageRecieve.mp3";
import MessageSentAudio from "../assets/message-sounds/MessageSent.mp3";


const NotificationSounds = [
  { name: "Default", audioId: 1001, audio: true, src: NotifationSoundOne },
  { name: "Chime", audioId: 1002, audio: true, src: NotifationSoundTwo },
  { name: "Pop", audioId: 1003, audio: true, src: NotifationSoundThree },
  { name: "Slient", audioId: 0, audio: false },
];

const MessageSounds = [MessageRecieveAuidio, MessageSentAudio]

export {
  NotifationSoundOne,
  NotifationSoundTwo,
  NotifationSoundThree,
  NotificationSounds,
  MessageSounds
};
