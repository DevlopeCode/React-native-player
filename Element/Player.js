import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import {Icon} from 'react-native-elements';
import {Images} from '../Assets';
import Slider from 'react-native-slider';
import {Songs} from '../data';
const {height, width} = Dimensions.get('window');

const setupPLayer = async () => {
  console.log('sdhfjksdhfjsdhfs.........................');
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
  });
  await TrackPlayer.add(Songs);
};

const togglePlayback = async playbackState => {
  const currentTrack = await TrackPlayer.getCurrentTrack();

  console.log('setup=>>>>>>>>', currentTrack);
  if (currentTrack !== null) {
    console.log('State.Paused=>>>>>>>>', State.Ready);
    console.log('playbackState=>>>>>>>>', playbackState);

    if (playbackState === State.Ready) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
};

const Player = () => {
  const playbackState = usePlaybackState();
  const progess = useProgress();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [songIndex, setsongIndex] = useState(0);
  const [repeteMode, setrepeteMode] = useState('off');
  const songSlider = useRef(null);
  const [trackArtwork, settrackArtwork] = useState();
  const [trackArtist, settrackArtist] = useState();
  const [trackTitle, settrackTitle] = useState();

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type == Event.PlaybackTrackChanged && event.nextTrack != null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title, Image, artist} = track;
      settrackTitle(title), settrackArtist(artist), settrackArtwork(Image);
    }
  });

  useEffect(() => {
    setupPLayer();
    scrollX.addListener(({value}) => {
      console.log('scroll X', scrollX);
      console.log('width', width);
      const index = Math.round(value / width);
      skipTo(index);
      setsongIndex(index);
      console.log('index', index);
    });
    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  const repeatIcon = () => {
    console.log('repeteMode.............', repeteMode);
    if (repeteMode == 'off') {
      return 'repeat-on';
    }
    if (repeteMode == 'track') {
      return 'repeat-one-on';
    }
    if (repeteMode == 'repeat') {
      return 'repeat';
    }
  };

  const changeRepeteMode = () => {
    if (repeteMode == 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setrepeteMode('track');
    }
    if (repeteMode == 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);

      setrepeteMode('repeat');
    }
    if (repeteMode == 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);

      setrepeteMode('off');
    }
  };

  const skipForward = () => {
    songSlider.current.scrollToOffset({offset: (setsongIndex + 1) * width});
  };
  const skipToNext = () => {
    songSlider.current.scrollToOffset({offset: (songIndex + 1) * width});
  };
  const skipToPrivious = () => {
    songSlider.current.scrollToOffset({offset: (songIndex - 1) * width});
  };

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };
  const RenderSongs = ({index, item}) => {
    return (
      <Animated.View
        style={{
          width: width,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={styles.artworkWrapper}>
          <Image source={trackArtwork} style={styles.artworkimage} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.maincontainer}>
        <View style={{width: width}}>
          <Animated.FlatList
            ref={songSlider}
            data={Songs}
            renderItem={RenderSongs}
            keyExtractor={item => item.id}
            horizontal={true}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      x: scrollX,
                    },
                  },
                },
              ],
              {useNativeDriver: true},
            )}
          />
        </View>
        <View>
          <Text style={styles.title}>{trackTitle}</Text>
          <Text style={styles.artist}>{trackArtist}</Text>
        </View>
        <View>
          <Slider
            value={progess.position}
            minimumValue={0}
            maximumValue={progess.duration}
            thumbTintColor="#FFD369"
            minimumTrackTintColor="#FFF369"
            maximumTrackTintColor="#FFF"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
            trackStyle={{
              height: 5,
              width: width / 1.2,
              backgroundColor: 'grey',
            }}
            thumbStyle={{height: 15, width: 15, backgroundColor: '#FFF369'}}
          />
          <View style={styles.progesslabelContainer}>
            <Text style={styles.progressLabel}>
              {new Date(progess.position * 1000).toISOString().substr(14, 5)}
            </Text>
            <Text style={styles.progressLabel}>
              {new Date((progess.duration - progess.position) * 1000)
                .toISOString()
                .substr(14, 5)}
            </Text>
          </View>
        </View>
        <View style={styles.musicControls}>
          <TouchableOpacity onPress={skipToPrivious}>
            <Icon name="skip-previous" color={'#FFF369'} size={35} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => togglePlayback(playbackState)}>
            <Icon
              name={playbackState === State.Playing ? 'pause' : 'play-arrow'}
              color={'#FFF369'}
              size={35}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipToNext}>
            <Icon name="skip-next" color={'#FFF369'} size={35} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomcontainer}>
        <View style={styles.bottomControls}>
          <TouchableOpacity>
            <Icon name="favorite-outline" color={'grey'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={changeRepeteMode}>
            <Icon
              name={`${repeatIcon()}`}
              color={repeteMode != 'off' ? '#FFF369' : '#777777'}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="ios-share" color={'grey'} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="more-horiz" color={'grey'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Player;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  maincontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomcontainer: {
    borderTopColor: 'grey',
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  artworkWrapper: {
    height: 300,
    width: 280,
    marginBottom: 25,
    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  artworkimage: {
    height: '100%',
    width: '100%',

    borderRadius: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#EEEEEE',
  },
  artist: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '200',
    color: '#EEEEEE',
  },
  progresscontainer: {
    height: 40,
    width: 280,
    marginTop: 25,
    flexDirection: 'row',
  },
  progesslabelContainer: {
    width: width / 1.2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#FFFF',
  },
  musicControls: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});
