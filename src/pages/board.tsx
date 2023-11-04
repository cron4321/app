import styled from "styled-components";
import Main from "../components/home/Main";
import React from "react";

function BoardPage() {
  return (
    <Container>
      <Main mynumber={15}/>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: f9f9f9;
`;

export default BoardPage;
