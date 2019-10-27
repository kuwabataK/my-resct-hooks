/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState, CSSProperties } from 'react'
import { cloneDeep } from 'lodash'
import interact from 'interactjs'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled])

  useEffect(() => {
    return disable
  }, [])

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
