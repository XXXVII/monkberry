import { sourceNode } from '../sourceNode';
import { map } from '../../utils';

export default function (ast) {
  ast.ElementNode.prototype.compileSvg = function (figure) {
    this.nodeName = this.name + figure.uniqid();

    figure.declarations.push(sourceNode(this.loc, [
      "var ", this.nodeName, " = document.createElementNS('http://www.w3.org/2000/svg', '", this.name, "');"
    ]));

    if (this.name == 'svg') {
      this.construct.push(sourceNode(this.loc, [
        this.nodeName, ".setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');"
      ]));
    }

    var children = map(this.body, (node) => {
      node.parent = this; // This is needed for backward lookup then optimizing "if" and "for".
      return node.compile(figure);
    });

    for (var child of children) {
      figure.construct.push(
        sourceNode(this.loc, [this.nodeName, ".appendChild(", child, ");"])
      );
    }

    this.attributes.map((attr) => attr.compile(figure, this.nodeName));

    return this.nodeName;
  };
}
