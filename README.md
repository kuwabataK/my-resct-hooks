これは自作の便利なReact Hooksをメモするためのプロジェクトです

## ビルド

```
$ npm start
```


## hooks

### usePrevious

レンダリング時に、指定した値が変更される前の値を取得することができる
cloneDeepを使って、deepなオブジェクトの深い部分が変更されても前の値を保持できるようにしている

```.ts

interface UsePreviousOption {
  deepCopy?: boolean
}

/**
 * 引数に指定した値を保存し、次のレンダリング時に返り値として所得することができます。
 * 初回レンダリング時の返り値は undefined になります
 *
 * @param value 保存する値
 * @param deepCopy trueを指定することで、lodashのcloneDeepを使ってdeepCopyした値を保存する
 *
 * @return preValue 前回保存された値
 */
export function usePrevious<T>(
  value: T,
  option: UsePreviousOption = {}
): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    const _value = option.deepCopy ? cloneDeep(value) : value

    ref.current = _value
  }, [value])

  return (ref.current as unknown) as T
}
```

#### 使い方

``` .ts
const preVal = usePrevious(val)
```

### useWatch

```.ts
/**
 * マウントのときに発火しないuseEffectを提供します
 * アンマウント時に実行する処理を指定することもできます
 * @param func 実行する処理
 * @param arr 監視対象の値の配列
 * @param onDestroy アンマウント時に実行される処理
 */
export function useWatch(
  func: () => void | undefined,
  arr: any[],
  onDestroy: () => void | undefined = () => {}
) {
  const [afterMountd, setMounted] = useState(false)
  useEffect(() => {
    if (afterMountd) {
      func()
    } else {
      setMounted(true)
    }
  }, arr)
  useEffect(() => {
    return onDestroy
  }, [])
}
```

#### 使い方

useEffectと同じ

```.ts

useWatch(() => {
    console.log('watchが発火')
}, [counter])

```

### useInteractJS

InteractJSを使ってコンポーネントを動かすためのフック

```.ts
const initPosition = {
  width: 100,
  height: 100,
  x: 0,
  y: 0
}

/**
 * HTML要素を動かせるようにする
 * 返り値で所得できるrefと、styleをそれぞれ対象となるHTML要素の
 * refとstyleに指定することで、そのHTML要素のリサイズと移動が可能になる
 * @param position HTML要素の初期座標と大きさ、指定されない場合はinitPositionで指定された値になる
 */
export function useInteractJS(
  position: Partial<typeof initPosition> = initPosition
) {
  const [_position, setPosition] = useState({
    ...initPosition,
    ...position
  })
  const [isEnabled, setEnable] = useState(true)

  const interactRef = useRef(null)
  let { x, y, width, height } = _position

  const enable = () => {
    interact((interactRef.current as unknown) as HTMLElement)
      .draggable({
        inertia: false
      })
      .resizable({
        // resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },
        preserveAspectRatio: false,
        inertia: false
      })
      .on('dragmove', event => {
        x += event.dx
        y += event.dy
        setPosition({
          width,
          height,
          x,
          y
        })
      })
      .on('resizemove', event => {
        width = event.rect.width
        height = event.rect.height
        x += event.deltaRect.left
        y += event.deltaRect.top
        setPosition({
          x,
          y,
          width,
          height
        })
      })
  }

  const disable = () => {
    interact((interactRef.current as unknown) as HTMLElement).unset()
  }

  useEffect(() => {
    if (isEnabled) {
      enable()
    } else {
      disable()
    }
    return disable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled])

  return {
    ref: interactRef,
    style: {
      transform: `translate3D(${_position.x}px, ${_position.y}px, 0)`,
      width: _position.width + 'px',
      height: _position.height + 'px',
      position: 'absolute' as CSSProperties['position']
    },
    position: _position,
    isEnabled,
    enable: () => setEnable(true),
    disable: () => setEnable(false)
  }
}
```

#### 使い方

動かしたいコンポーネントにstyleとrefを設定する

```.ts
const App: React.FC = () => {
  const interact = useInteractJS()

  return (
    <div className="App">
      <button onClick={() => interact.enable()}>有効化</button>
      <button onClick={() => interact.disable()}>無効化</button>
      <div
        ref={interact.ref}
        style={{
          ...interact.style,
          border: '2px solid #0489B1',
          backgroundColor: '#A9D0F5'
        }}
      />
    </div>
  )
}
```