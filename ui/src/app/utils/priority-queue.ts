type Tuple<T> = [T, number];

export class PriorityQueue<T> {
  values: Tuple<T>[];

  constructor() {
    this.values = [];
  }

  enqueue(node: T, priority: number) {
    let flag = false;
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i][1] > priority) {
        this.values.splice(i, 0, [node, priority]);
        flag = true;
        break;
      }
    }
    if (!flag) {
      this.values.push([node, priority]);
    }
  }

  dequeue() {
    const item = this.values.shift();

    if (item === undefined) {
      return undefined;
    }

    return item[0];
  }

  size() {
    return this.values.length;
  }
}
