from videosdk import ParticipantEventHandler, Stream

class MyParticipantEventHandler(ParticipantEventHandler):
    def __init__(self, participant_id: str):
        super().__init__()
        self.participant_id = participant_id

    def on_stream_enabled(self, stream: Stream):
        print("Participant stream enabled:", self.participant_id, stream.kind)

    def on_stream_disabled(self, stream: Stream):
        print("Participant stream disabled:", self.participant_id, stream.kind)