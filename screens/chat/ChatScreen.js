// import React from 'react';
// import { SafeAreaView } from 'react-native';
// import { Channel, MessageList, MessageInput } from 'stream-chat-expo';
// import { StreamChat } from 'stream-chat';

// const chatClient = StreamChat.getInstance('tmz5yhrtcwtr');

// const ChatScreen = ({ route }) => {
//   const { user } = route.params;
//   const channel = chatClient.channel('messaging', {
//     members: [chatClient.userID, user.id],
//   });

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <Channel channel={channel}>
//         <MessageList />
//         <MessageInput />
//       </Channel>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;
